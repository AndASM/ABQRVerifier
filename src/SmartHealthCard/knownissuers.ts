// @ts-ignore
import {importJWK} from 'jose/key/import'
import type {KeyLike,JWK} from 'jose/types'
import _issuerNames from '../../jwks/issuer-names.json'
// @ts-ignore
import jwk_json from '../../jwks/**/*.jwks.json'


export const issuerNames = _issuerNames

type KeyType = KeyLike | Uint8Array
type IdKeys = {[kid: string]: KeyType}
type KnownIssuers = {[issuer: string]: IdKeys}

async function makeKnownIssuers() {
  const knownIssuers: KnownIssuers = {}
  
  let key: keyof typeof _issuerNames
  for (key in _issuerNames) {
    const keyEntries = await Promise.all<[string, KeyType]>(jwk_json[key].keys.map(async (value:JWK) => [value.kid, await importJWK(value)]))
    knownIssuers[_issuerNames[key]] = Object.fromEntries<KeyType>(keyEntries)
  }
  return knownIssuers
}

console.log(JSON.stringify(makeKnownIssuers()))

let knownIssuers: KnownIssuers

export async function getKnownIssuers(issuer: string) {
  if (!knownIssuers)
    knownIssuers = await makeKnownIssuers()
  return knownIssuers[issuer]
}

