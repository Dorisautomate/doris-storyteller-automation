$args = @(
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    "--user-data-dir=C:\Users\doris\ChromeProfile",
    "--profile-directory=Profile 2",
    "--enable-logging=stderr",
    "--v=1",
    "https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6"
)
& "C:\Program Files\Google\Chrome\Application\chrome.exe" @args
