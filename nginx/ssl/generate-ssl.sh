#!/bin/bash
# Tao thu muc neu chua co
mkdir -p "$(dirname "$0")"
cd "$(dirname "$0")"

# Tao Private Key va Tu ky Certificate cho 192.168.253.129 & localhost
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout server.key \
  -out server.crt \
  -subj "/C=VN/ST=Hanoi/L=Hanoi/O=DTC245200257/OU=IT/CN=192.168.253.129" \
  -addext "subjectAltName=DNS:localhost,IP:192.168.253.129,IP:127.0.0.1"

echo "Chung chi SSL tu ky da duoc tao thanh cong!"
