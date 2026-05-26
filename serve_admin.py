import http.server
import socketserver
import socket
import os

PORT = 8081

class DualStackTCPServer(socketserver.TCPServer):
    address_family = socket.AF_INET6
    allow_reuse_address = True
    
    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except Exception:
            pass
        super().server_bind()

if __name__ == '__main__':
    # Make sure we serve from the directory of this file
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    handler = http.server.SimpleHTTPRequestHandler
    with DualStackTCPServer(("", PORT), handler) as httpd:
        print(f"BNC Admin Portal running on http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down admin server.")
            httpd.server_close()
