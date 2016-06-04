# WWWEB

An autonomous webcrawler for indexing robots.txt files.

## Requirements

* node.js ^6.0.0

## Usage

```sh
wwweb -d <domain> [-s <interval>] -o <directory> [--rest <seconds>] [[-v] -v] [-t <timeout>]
```

## Options

| Flag | Alias | Description | Info |
|:--|:--|:--|:--|
| `--domain` | `-d` | Initial domain | required |
| `--save-interval` | `-s` | Interval in seconds for outputting reports | default: 30 |
| `--output` | `-o` | Name of the output directory | required |
| `--help` | `-h` | Show help | |
| `--rest` | `-r` | Seconds to rest between requests | default: 0 |
| `--timeout` | `-t` | Milliseconds before a request times out | default: 15000 |
| `--verbose` | `-v` | Verbose output of what is going on | -vv for debug output |
| `--no-color` | | Disable colorful output | |

## Examples

Crawl from example.org and output files to the current working directory:

```sh
wwweb -d example.org -o .
```

Crawl from example.org, output files to ./reports/, output warning, wait eight seconds for files to load and save a report every minute.

```sh
wwweb -d example.org -o reports/ -v -t 8000 -s 60
```