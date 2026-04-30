---
title: "How I profiled Go code with pprof"
slug: go-pprof
date: 2020-03-17
authors:
  - Tomoya Amachi
published: true
description: ""
---
I have been using Go language(Golang). I like Golang because it has great official tools and it’s easy to start developing and improving products. For example, Golang has an official code formatter go fmt, so I do not care about coding rules while writing Golang.

Today I will introduce Golang official code profiling tool pprof, it also visualizes profiling data. It is very easy to use.

---

Let's profiling my project, Dockertags. [https://github.com/goodwithtech/dockertags](https://github.com/goodwithtech/dockertags)

3/19/2020 : Fix "go tool pprof -http=" commands args. Thank you [@orisano](https://twitter.com/orisano).

# 1. Insert following code where head of main function

You only need to insert the following code to the existing main() function. It creates a profiling file to "cpu.pprof".

```bash
func main() {
  f, perr := os.Create("cpu.pprof")
	if perr != nil {
		l.Fatal(perr)
	}
	pprof.StartCPUProfile(f)
	defer pprof.StopCPUProfile()
  ...
```

Refer to [this line](https://github.com/goodwithtech/dockertags/blob/master/cmd/dockertags/main.go#L19) in my project.

# 2. Build

`cmd/dockertags` is the main package in my project. So I built this packages.

```bash
$ cd $GOPATH/github.com/goodwithtech/dockertags
$ go build -o pprofbin $(pwd)/cmd/dockertags
$ ls -l
...
-rwxr-xr-x   1 amachi  staff  19166732  3 17 21:34 pprofbin
```

# 3. Run binary

```bash
$ ./pprofbin debian
+--------------------------------+--------------------------------+--------------------------------+--------------------------------+------------+----------------------+
|              TAG               |              SIZE              |             DIGEST             |            OS/ARCH             | CREATED AT |     UPLOADED AT      |
+--------------------------------+--------------------------------+--------------------------------+--------------------------------+------------+----------------------+
| experimental                   | 50.5M                          | 40de0ac07cc3                   | linux/386                      | NULL       | 2020-02-26T03:28:20Z |
| experimental-20200224          | 47.5M                          | e3924f178cd9                   | linux/arm                      |            |                      |
|                                | 53.1M                          | ab1d3e87b309                   | linux/ppc64le                  |            |                      |
|                                | 49.5M                          | f33a8a0f4aa9                   | linux/amd64                    |            |                      |
|                                | 48.5M                          | 571604dbc1f1                   | linux/arm64                    |            |                      |
|                                | 45.4M                          | 2cba7c819879                   | linux/arm                      |            |                      |
|                                | 48.1M                          | 4608748f734f                   | linux/s390x                    |            |                      |
+--------------------------------+--------------------------------+--------------------------------+--------------------------------+------------+----------------------+
...
$ ls -l
...
-rw-r--r--   1 amachi  staff      3357  3 17 21:35 cpu.pprof
```

Then cpu.pprof outputs to current directory.

# 4. Profile

Now we are ready to profile our application. We can profile our application via web or CLI.

## 4-A. Profile via web

I recommend profiling via the web because you can use [a flame graph](http://www.brendangregg.com/flamegraphs.html). Flame graphs make it easy to understand call trees and which functions use which resources. We can check this interactively like [in this page](http://www.brendangregg.com/FlameGraphs/cpu-mysql-updated.svg).

This is flame graph of Dockertags. 

<!-- TODO: image download failed for e1bdcee9-b380-4f9f-bb3e-ac3753096b1c src=https://s3-us-west-2.amazonaws.com/secure.notion-static.com/d982d87f-cf25-4380-98fa-49a0511e7b1e/flamegraph.png -->

You only need to do the following steps to check a flame graph.

1. Run "go tool pprof -http=<port> <binary file> <profiling file>".
```bash
$ go tool pprof -http=":8000" pprofbin ./cpu.pprof
Serving web UI on http://localhost:8000
```

2. Open "localhost:<port>" and select "flame graph" from the VIEW menus in the site header.

<!-- TODO: image download failed for 18db8b85-787e-4bdb-a48d-3e90bd5e7bde src=https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c3a81f45-6cda-4110-a97f-c41a497867b9/graph.png -->

## 4-B. Profile via CLI

You only need to run  "go tool pprof <binary file> <profile data file>".

```bash
$ go tool pprof pprofbin cpu.pprof
File: pprofbin
Type: cpu
Time: Mar 17, 2020 at 9:39pm (JST)
Duration: 2.99s, Total samples = 80ms ( 2.68%)
Entering interactive mode (type "help" for commands, "o" for options)
(pprof)
```

I will introduce well-known commands.

"list" shows top nodes and "tree" shows top nodes with call stacks.

```bash
(pprof) top
Showing nodes accounting for 80ms, 100% of 80ms total
Showing top 10 nodes out of 35
      flat  flat%   sum%        cum   cum%
      50ms 62.50% 62.50%       50ms 62.50%  runtime.cgocall
      20ms 25.00% 87.50%       20ms 25.00%  runtime.madvise
      10ms 12.50%   100%       10ms 12.50%  crypto/elliptic.p256Sqr
         0     0%   100%       10ms 12.50%  crypto/elliptic.(*p256Point).p256BaseMult
         0     0%   100%       10ms 12.50%  crypto/elliptic.GenerateKey
         0     0%   100%       10ms 12.50%  crypto/elliptic.initTable
         0     0%   100%       10ms 12.50%  crypto/elliptic.p256Curve.ScalarBaseMult
         0     0%   100%       10ms 12.50%  crypto/elliptic.p256Inverse
         0     0%   100%       50ms 62.50%  crypto/tls.(*Conn).Handshake
         0     0%   100%       50ms 62.50%  crypto/tls.(*Conn).clientHandshake

(pprof) tree
Showing nodes accounting for 80ms, 100% of 80ms total
----------------------------------------------------------+-------------
      flat  flat%   sum%        cum   cum%   calls calls% + context
----------------------------------------------------------+-------------
                                              40ms 80.00% |   crypto/x509._Cfunc_CopyPEMRoots
                                              10ms 20.00% |   net._C2func_getaddrinfo
      50ms 62.50% 62.50%       50ms 62.50%                | runtime.cgocall
----------------------------------------------------------+-------------
                                              20ms   100% |   runtime.sysUsed
      20ms 25.00% 87.50%       20ms 25.00%                | runtime.madvise
----------------------------------------------------------+-------------
                                              10ms   100% |   crypto/elliptic.p256Inverse
      10ms 12.50%   100%       10ms 12.50%                | crypto/elliptic.p256Sqr
----------------------------------------------------------+-------------
                                              10ms   100% |   crypto/elliptic.p256Curve.ScalarBaseMult
         0     0%   100%       10ms 12.50%                | crypto/elliptic.(*p256Point).p256BaseMult
                                              10ms   100% |   sync.(*Once).Do (inline)
----------------------------------------------------------+-------------
```

"web", "gif", "svg" shows a visualize graph. The "web" command opens a web browser and "gif", "svg" output an image file. Larger boxes use more CPU resources.

```bash
(pprof) gif
Generating report in profile001.gif
```

<!-- TODO: image download failed for ff9b2d1e-16ef-4e11-9348-17c9bddcfdcf src=https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c543bf81-3089-4ae6-8b5b-f7948ab1d26a/profile001.gif -->

# Conclusion

Today I only introduced the main features of pprof but pprof has more cool features.

For example, we can check memory leaks with memory profiling and visualize how to improve performance before fixing code.
