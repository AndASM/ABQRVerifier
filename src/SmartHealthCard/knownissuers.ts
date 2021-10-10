// @ts-ignore
import {importJWK} from 'jose/key/import'
import type {KeyLike,JWK} from 'jose/types'
// @ts-ignore
import jwk_json from '../../jwks/**/*.json'
// Alberta value derived from known signature
// Other values from https://raw.githubusercontent.com/olalonde/shc-protocol/master/src/keys.ts

type KeyType = KeyLike | Uint8Array
type IdKeys = {[kid: string]: KeyType}
type KnownIssuers = {[issuer: string]: IdKeys}

async function makeKnownIssuers() {
  const issuerNames = jwk_json['issuer-names']
  const knownIssuers: KnownIssuers = {}
  for (const key in issuerNames) {
    const keyEntries = await Promise.all<[string, KeyType]>(jwk_json[key].keys.map(async (value:JWK) => [value.kid, await importJWK(value)]))
    knownIssuers[issuerNames[key]] = Object.fromEntries<KeyType>(keyEntries)
  }
  return knownIssuers
}

console.log(JSON.stringify(makeKnownIssuers()))

var knownIssuers: KnownIssuers

export async function getKnownIssuers(issuer: string) {
  if (!knownIssuers)
    knownIssuers = await makeKnownIssuers()
  return knownIssuers[issuer]
}

