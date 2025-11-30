# Tailscale

## Configuration

```json
{
  "tagOwners": {
    "tag:customer-machine": ["autogroup:admin"],
    "tag:dflow-proxy": ["autogroup:admin"],
    "tag:dflow-support": ["autogroup:admin"]
  },
  "grants": [
    {
      "src": ["autogroup:admin"],
      "dst": ["tag:customer-machine"],
      "ip": ["*"]
    },
    {
      "src": ["tag:dflow-proxy"],
      "dst": ["tag:customer-machine"],
      "ip": ["*"]
    },
    {
      "src": ["tag:dflow-support"],
      "dst": ["tag:customer-machine"],
      "ip": ["*"]
    }
  ],
  "ssh": [
    {
      "action": "accept",
      "src": ["autogroup:admin", "tag:dflow-support"],
      "dst": ["tag:customer-machine"],
      "users": ["autogroup:admin", "root"]
    }
  ]
}
```
