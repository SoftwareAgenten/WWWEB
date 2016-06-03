'use strict'

// Node Modules

const readline = require('readline')

// Modules Setup

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

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
    report: null
  }
  
  self.init = initialAddress => {
    self.report = new Report(initialAddress)
  }
  
  return self
}())

// Startup Logic

rl.question('Initial domain: ', answer => {
  WWWEB.init(answer)
  rl.close()
})