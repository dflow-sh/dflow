---
title: 'Proxy'
category: 'Services'
order: 5
categoryOrder: 5
---

# Proxy

dFlow by default comes with nginx proxy support. Parameters can be configured
from `proxy` tab.

### Nginx

Here're the list of parameters you can configure for nginx proxy

| Property              | Default | Description                                                                  |
| --------------------- | ------- | ---------------------------------------------------------------------------- |
| client-max-body-size  | 1m      | Size (with units) of client request body (usually modified for file uploads) |
| client-body-timeout   | 60s     | Timeout (with units) for reading the client request body                     |
| client-header-timeout | 60s     | Timeout (with units) for reading the client request headers                  |
