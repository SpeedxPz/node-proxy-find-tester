# node-proxy-find-tester
The worst proxy retrieve &amp; tester you ever seen

## Requirements:
  - Google Cloud AppEngine
  - Google Cloud Firebase
  
  
## Deployment
  Just create firebase collection and deploy this to AppEngine
  
### Environment Variables

Variable | Description 
--- | --- 
`COLLECTION_NAME` | Collection name to store the proxylist
`OPTION_MAX_RETRY` | Max retry when this app test your proxy
`OPTION_MAX_TIMEOUT` | Max timeout when waiting for response from test url
`TEST_OPTION_PING_URL` | URL to use for latency test
`TEST_OPTION_SPEED_URL` | URL to use for speed test

### Crontab
 Google AppEngine cron included and will do updateproxy every 1 hour
If you want to change the interval just edit in cron.yaml

### /proxy_plugins
 You can add more site to crawl the proxy by add new files

### Contribution

This thing bad than you expect, Feel free to improve this if you want
