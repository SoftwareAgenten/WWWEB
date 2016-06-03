#!/usr/bin/env node
'use strict'

// Node Modules

const readline = require('readline')
const yargs = require('yargs')

// Modules Setup

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const argv = yargs.argv

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

rl.question('Initial domain: ', answer => {
  WWWEB.init(answer)
  rl.close()
})