'use strict'

const createNode = require('./create-node.js')
const series = require('async/series')
const dagPB = require('ipld-dag-pb')

createNode((err, ipfs) => {
  if (err) {
    throw err
  }

  console.log('\nStart of the example:')

  let cidPBNode
  let cidCBORNode

  series([
    (cb) => {
      const someData = Buffer.from('capoeira')
      let node

      try {
        node = dagPB.DAGNode.create(someData)
      } catch (err) {
        return cb(err)
      }

      ipfs.dag.put(node, { format: 'dag-pb', hashAlg: 'sha2-256' }, (err, cid) => {
        if (err) {
          return cb(err)
        }
        cidPBNode = cid
        cb()
      })
    },
    (cb) => {
      const myData = {
        name: 'David',
        likes: ['js-ipfs', 'icecream', 'steak'],
        hobbies: [{ '/': cidPBNode.toBaseEncodedString() }]
      }

      ipfs.dag.put(myData, { format: 'dag-cbor', hashAlg: 'sha3-512' }, (err, cid) => {
        if (err) {
          throw err
        }

        cidCBORNode = cid
        cb()
      })
    },
    (cb) => {
      ipfs.dag.tree(cidCBORNode, { recursive: true }, (err, paths) => {
        if (err) {
          throw err
        }

        console.log(paths)
      })
    }
  ], (err) => {
    console.error('Error:', err)
  })
})
