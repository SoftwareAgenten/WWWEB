#!/usr/bin/env node
'use strict'

// Node Modules

const yargs = require('yargs')

// Modules Setup

const argv = yargs
  .usage('usage: $0 -d domain [--rest=0]')
  .demand('d')
  .alias('d', 'domain')
  .nargs('d', 1)
  .describe('d', 'Initial domain')
  .default('rest', 0)
  .alias('rest', 'r')
  .describe('r', 'Seconds to rest between requests')
  .help('help')
  .alias('help', 'h')
  .example('$0 -d example.org --rest=1', 'start crawling at example.org with 1 second rest between requests')
  .argv

// Classes

class RuleSet {
  constructor(userAgent, rules) {
    this.userAgent = userAgent
    this.rules = rules
  }
}

class DomainSettings {
  constructor(domain, rulesets) {
    this.domain = domain
    this.rulesets = rulesets
  }
  
  addRuleset(ruleset) {
    this.rulesets.push(ruleset)
  }
}

class Record {
  constructor(timestamp, domainSettings) {
    this.timestamp
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
  constructor(initialAddress) {
    this.initialAddress = initialAddress
    this.protocol = new Protocol()
  }
}

// Main Routine

const WWWEB = (() => {
  const self = {
    initialAddress: null,
    restTime: 0, // seconds
    report: null,
    domainStack: [],
    processedDomains: []
  }
  
  self.init = initialAddress => {
    self.initialAddress = initialAddress
    self.report = new Report(initialAddress)
  }
  
  const processDomain = domain => {
    // Request robots.txt
    
    // Interpret robots.txt
    
    // Fulfill DomainSettings Promise
    
  }
  
  const performRoutine = domain => {
    let timestamp = Date.now()
    
    processDomain(domain).then(domainSettings => {
      let newRecord = new Record(timestamp, domainSettings)
      self.report.protocol.addRecord(newRecord)
      
      self.processedDomains.push(domain)
      
      if (self.domainStack.length > 0) {
        setTimeout(function () {
          performRoutine(self.domainStack.pop())
        }, self.restTime)
      }
    })
  }
  
  self.run = restTime => {
    self.restTime = (typeof restTime === 'number') ? restTime : 0
    
    performRoutine(self.initialAddress)
  }
  
  return self
}())

// Startup Logic

WWWEB.init(argv.domain)
WWWEB.run(argv.rest)