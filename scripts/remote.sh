ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no $1 <<EOF
$2
EOF

# Wrote .ssh/config instead