import usocket as socket
import ustruct as struct


class MQTTException(Exception):
    pass


class MQTTClient:
    def __init__(self, client_id, server, port=0, user=None, password=None, keepalive=0, ssl=False, ssl_params={}):
        if port == 0:
            port = 8883 if ssl else 1883
        self.client_id = client_id
        self.sock = None
        self.server = server
        self.port = port
        self.ssl = ssl
        self.ssl_params = ssl_params
        self.pid = 0
        self.cb = None
        self.user = user
        self.pswd = password
        self.keepalive = keepalive
        self.lw_topic = None
        self.lw_msg = None
        self.lw_qos = 0
        self.lw_retain = False

    def _send_str(self, s):
        self.sock.write(struct.pack("!H", len(s)))
        self.sock.write(s)

    def _recv_len(self):
        n = 0
        sh = 0
        while 1:
            b = self.sock.read(1)[0]
            n |= (b & 0x7f) << sh
            if not b & 0x80:
                return n
            sh += 7

    def set_callback(self, f):
        self.cb = f

    def set_last_will(self, topic, msg, retain=False, qos=0):
        self.lw_topic = topic
        self.lw_msg = msg
        self.lw_qos = qos
        self.lw_retain = retain

    def connect(self, clean_session=True):
        self.sock = socket.socket()
        addr = socket.getaddrinfo(self.server, self.port)[0][-1]
        self.sock.connect(addr)
        if self.ssl:
            import ussl
            self.sock = ussl.wrap_socket(self.sock, **self.ssl_params)
        premsg = bytearray(b"\x10\0\0\0\0\0")
        msg = bytearray(b"\x04MQTT\x04\x02\0\0")
        if not clean_session:
            msg[7] = 0
        if self.user is not None:
            msg[7] |= 0xC0
        if self.keepalive:
            assert self.keepalive < 65536
            msg[8] = self.keepalive >> 8
            msg[9] = self.keepalive & 0x00FF
        if self.lw_topic is not None:
            msg[7] |= 0x04 | (self.lw_qos & 0x03) << 3
            if self.lw_retain:
                msg[7] |= 0x20
        self.sock.write(premsg)
        self._send_str(msg)
        self._send_str(self.client_id)
        if self.lw_topic is not None:
            self._send_str(self.lw_topic)
            self._send_str(self.lw_msg)
        if self.user is not None:
            self._send_str(self.user)
            self._send_str(self.pswd)
        resp = self.sock.read(4)
        assert resp[0] == 0x20 and resp[1] == 0x02
        if resp[3] != 0:
            raise MQTTException(resp[3])
        return resp[2] & 1

    def disconnect(self):
        self.sock.write(b"\xe0\0")
        self.sock.close()

    def ping(self):
        self.sock.write(b"\xc0\0")

    def publish(self, topic, msg, retain=False, qos=0):
        pkt = bytearray(b"\x30\0\0\0")
        pkt[0] |= qos << 1
        if retain:
            pkt[0] |= 1
        opkt = pkt
        sz = 2 + len(topic) + len(msg)
        if qos > 0:
            sz += 2
        assert sz < 2097152
        i = 1
        while sz > 0x7f:
            pkt[i] = (sz & 0x7f) | 0x80
            sz >>= 7
            i += 1
        pkt[i] = sz
        self.sock.write(pkt)
        self._send_str(topic)
        if qos > 0:
            self.pid += 1
            struct.pack_into("!H", pkt, 0, self.pid)
            self.sock.write(pkt, 2)
        self.sock.write(msg)

    def subscribe(self, topic, qos=0):
        assert self.cb is not None
        pkt = bytearray(b"\x82\0\0\0")
        self.pid += 1
        struct.pack_into("!H", pkt, 1, self.pid)
        sz = 2 + 2 + len(topic) + 1
        assert sz < 128
        pkt[3] = sz
        self.sock.write(pkt)
        self._send_str(topic)
        self.sock.write(struct.pack("B", qos))
        resp = self.sock.read(5)
        assert resp[0] == 0x90 and resp[1] == 0x03
        assert resp[2] == pkt[1] and resp[3] == pkt[2]
        if resp[4] == 0x80:
            raise MQTTException(resp[4])

    def wait_msg(self):
        res = self.sock.read(1)
        self.sock.setblocking(True)
        if res is None:
            return None
        if res == b"":
            raise OSError(-1)
        if res == b"\xd0":
            sz = self.sock.read(1)[0]
            assert sz == 0
            return None
        op = res[0]
        if op & 0xf0 != 0x30:
            return op
        sz = self._recv_len()
        topic_len = struct.unpack("!H", self.sock.read(2))[0]
        topic = self.sock.read(topic_len)
        sz -= 2 + topic_len
        if op & 0x06:
            pid = struct.unpack("!H", self.sock.read(2))[0]
            sz -= 2
        msg = self.sock.read(sz)
        self.cb(topic, msg)
        if op & 0x06 == 2:
            pkt = bytearray(b"\x40\x02\0\0")
            struct.pack_into("!H", pkt, 2, pid)
            self.sock.write(pkt)
        elif op & 0x06 == 4:
            assert 0

    def check_msg(self):
        self.sock.setblocking(False)
        return self.wait_msg()
