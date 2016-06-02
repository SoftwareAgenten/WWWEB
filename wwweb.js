'use strict'

class Protocol {
  constructor(initialAddress) {
    this.initialAddress = initialAddress
  }
}

let init = address => {
  
}

// Save on Exit

process.stdin.resume()

let quit = () => {
  console.log('saving protocol...')
  // TODO: save protocol
  process.exit()
}

process.on('exit', quit)
process.on('SIGINT', quit)
process.on('uncaughtException', quit)