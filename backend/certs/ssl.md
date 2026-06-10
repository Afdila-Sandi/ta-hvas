openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
 -keyout hvas.key \
 -out hvas.crt \
 -subj "/O=BSPJI/OU=Lab Udara/CN=IP SERVER"
 -addext "subjectAltName=IP:IP SERVER"
