#!/usr/bin/env node
'use strict'

// Node Modules

const fs = require('fs')
const yargs = require('yargs')
const axios = require('axios')
const colors = require('colors')

// Modules Setup

const argv = yargs
  .usage('usage: $0 -d <domain> [-s <interval>] -o <directory> [--rest <seconds>] [[-v] -v] [-t <timeout>]')
  // --domain
  .demand('d')
  .alias('d', 'domain')
  .nargs('d', 1)
  .describe('d', 'Initial domain')
  // --save-interval
  .default('save-interval', 30)
  .alias('s', 'save-interval')
  .describe('s', 'Interval in seconds for outputting reports')
  // --output
  .demand('output')
  .alias('o', 'output')
  .nargs('d', 1)
  .describe('o', 'Name of the output directory')
  // --rest
  .default('rest', 0)
  .alias('rest', 'r')
  .describe('r', 'Seconds to rest between requests')
  // --timeout
  .default('timeout', 15 * 1000)
  .alias('timeout', 't')
  .describe('t', 'Milliseconds before a request times out')
  // --verbose
  .count('verbose')
  .alias('verbose', 'v')
  .describe('v', 'Verbose output of what is going on')
  // --no-color
  .boolean('no-color')
  .default('rest', false)
  .describe('no-color', 'Disable colorful output')
  // --help
  .help('help')
  .alias('help', 'h')
  // examples
  .example('$0 -d example.org -o .', 'start crawling at example.org and output files to current directory')
  .argv

// Utility

const VERBOSE_LEVEL = argv.verbose

const debug = message => {
  if (VERBOSE_LEVEL >= 2) {
    console.log(`[debug] ${message}`.grey)
  }
}
const warn = message => {
  if (VERBOSE_LEVEL >= 1) {
    console.log(`[warning] ${message}`.yellow)
  }
}

// User Config

axios.defaults.timeout = argv.timeout

// Classes

class RuleSet {
  constructor(userAgent, rules = []) {
    this.userAgent = userAgent
    this.rules = rules
  }
  
  addRule(rule) {
    this.rules.push(rule)
  }
}

class DomainSettings {
  constructor(domain, rulesets = []) {
    this.domain = domain
    this.rulesets = rulesets
  }
  
  addRuleset(ruleset) {
    this.rulesets.push(ruleset)
  }
}

class Record {
  constructor(timestamp, domainSettings) {
    this.timestamp = timestamp
    this.domainSettings = domainSettings
  }
}

class Protocol {
  constructor() {
    this.records = []
  }
  
  addRecord(record) {
    this.records.push(record)
  }
}

class Report {
  constructor(datetime, initialAddress) {
    this.datetime = datetime
    this.initialAddress = initialAddress
    this.protocol = new Protocol()
  }
}

// Constants

const HTML_LINK_REGEX = /<\s*a.*?href\s*=\s*["']\s*https?:\/\/.*?((?:[\w\d-]+\.)+[\w\d-]+).*?["'][^>]*>.*?<\s*?\/\s*?a\s*?>/ig
const GRAP_UA_REGEX = /User-agent:\s*(.*)/i
const GRAP_RULE_REGEX = /Disallow:\s*(.*)/i

// Main Routine

const WWWEB = (() => {
  const self = {
    initialAddress: null,
    restTime: 0, // seconds
    report: null,
    domainStack: [],
    previousDomains: []
  }
  
  self.init = (initialAddress, restTime = 0) => {
    self.initialAddress = initialAddress
    self.restTime = restTime
    self.report = new Report(Date.now(), initialAddress)
    
    debug(`init with restTime: ${restTime}`)
  }
  
  const processDomain = domain => {
    console.log(`* processing ${domain.blue}...`)
    
    return new Promise((resolve, reject) => {
      axios.get(`http://${domain}/`).then(response => {
        console.log('├ '+'found startpage'.green)
        
        const HTML = response.data
        let newDomains = []
        let match = null
        
        while (match = HTML_LINK_REGEX.exec(HTML)) {
          newDomains.push(match[1])
        }
        
        newDomains
          .filter((x, index) => newDomains.indexOf(x) === index) // unique only
          .filter(x => x !== domain) // filter out current domain
          .filter(x => self.previousDomains.indexOf(x) === -1) // keep unknown
          .forEach(x => self.domainStack.push(x)) // add new domains to stack
        
        debug(`added ${newDomains.length} new domains to the stack`)
      }, error => {
        if (error.code === 'ECONNABORTED') {
          console.log('├ '+'connection timeout for startpage'.red)
        } else {
          console.log('├ '+'no startpage'.red)
        }
      }).then(() => {
        axios.get(`http://${domain}/robots.txt`).then(response => {
          // Check Content-Type
          if (!/text\/plain/i.test(response.headers['content-type'])) {
            console.log('└ '+'invalide robots.txt'.red)
            reject()
            return
          }
          
          console.log('└ '+'found robots.txt'.green)
          
          let domainSettings = new DomainSettings(domain)
          const lines = response.data.split('\n')
          let currentRuleset = null
          
          // Parse robots.txt, Line by Line
          lines.forEach(line => {
            if (/^User-agent:/i.test(line)) {
              const UA = GRAP_UA_REGEX.exec(line)[1]
                            
              if (currentRuleset !== null) {
                // Save old Ruleset
                domainSettings.addRuleset(currentRuleset)
              }
              currentRuleset = new RuleSet(UA)
            }
            
            else if (/^Disallow:/i.test(line)) {
              if (currentRuleset === null) {
                warn('rule without user-agent was found and ignored')
                return
              }
              
              const rule = GRAP_RULE_REGEX.exec(line)[1]
              currentRuleset.addRule(rule)
            }
          })
          
          debug(`did parse robots.txt of ${domain}`)
          
          // Add last Ruleset to DomainSettings
          domainSettings.addRuleset(currentRuleset)
          
          if (currentRuleset === null) {
            warn('robots.txt did not specify any rules')
          }
          
          resolve(domainSettings)
          debug('resolved domain settings')
        }, error => {
          if (error.code === 'ECONNABORTED') {
            console.log('└ '+'connection timeout for robots.txt'.red)
          } else {
            console.log('└ '+'no robots.txt'.red)
          }
          reject()
        })
      })
    })
  }
  
  const crawl = () => {
    self.domainStack = self.domainStack
      .filter(x => self.previousDomains.indexOf(x) === -1)
      .filter(x => self.previousDomains.indexOf(x.replace(/^www\./, '')) === -1)
      .filter(x => self.previousDomains.indexOf(`www.${x}`) === -1)
    
    debug(`domainstack height: ${self.domainStack.length}`)
    
    if (self.domainStack.length > 0) {
      // rest for some time
      setTimeout(function () {
        performRoutine(self.domainStack.pop())
      }, self.restTime * 1000)
      
      if (argv.verbose && self.restTime > 0) {
        console.log(`[info] resting for ${self.restTime}s...`)
      }
    } else {
      // terminate
      console.log('no next domain to process')
    }
  }
  
  const performRoutine = domain => {
    let timestamp = Date.now()
    
    processDomain(domain).then(domainSettings => {
      let newRecord = new Record(timestamp, domainSettings)
      
      // store new record
      self.report.protocol.addRecord(newRecord)
      self.previousDomains.push(domain)
      
      crawl()
    }).catch(() => {
      // store domain regardless
      self.previousDomains.push(domain)
      crawl()
    })
  }
  
  self.run = () => {
    performRoutine(self.initialAddress)
    debug(`started running`)
    
    setInterval(() => {
      const output = JSON.stringify(self.report)
      const filename = 'wwweb-report_' + (new Date()).toISOString()
        .replace(/:/g, '-')
        .replace(/T/, '_')
        .replace(/\..*/, '')
      const filepath = `${argv.output}/${filename}.json`
      
      // Write File to Report Directory
      fs.writeFile(filepath, output, error => {
        if (error) {
          console.log(error)
          console.log(`[error] cloud no save report to ${dirname}`.red)
          return
        }
        
        console.log('[report saved]'.grey)
      })
    }, argv.saveInterval * 1000)
  }
  
  return self
})()

// Startup Logic

WWWEB.init(argv.domain, argv.rest)
WWWEB.run()