'use strict'

// Node Modules

const readline = require('readline')

// Modules Setup

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Classes

class Protocol {
  constructor() {}
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