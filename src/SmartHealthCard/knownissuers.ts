// @ts-ignore
import {importJWK} from 'jose/key/import'
import type {KeyLike} from 'jose/types'
// @ts-ignore
import * as test1 from '../../jwks/*.json'
console.log('loaded')
// Alberta value derived from known signature
// Other values from https://raw.githubusercontent.com/olalonde/shc-protocol/master/src/keys.ts

const knownIssuer: { [key: string]: Promise<KeyLike | Uint8Array> } = {
  'https://covidrecords.alberta.ca/smarthealth/issuer':
      importJWK({
        kid: 'JoO-sJHpheZboXdsUK4NtfulfvpiN1GlTdNnXN3XAnM',
        alg: 'ES256',
        kty: 'EC',
        crv: 'P-256',
        use: 'sig',
        x: 'GsriV0gunQpl2X9KgrDZ4EDCtIdfOmdzhdlosWrMqKk',
        y: 'S99mZMCcJRsn662RaAmk_elvGiUs8IvSA7qBh04kaw0'
      }),
  'https://covid19.quebec.ca/PreuveVaccinaleApi/issuer':
      importJWK({
        kid: 'Nqa1zvChOkoA46B5ZM_oK3MDhL3-mnLERV_30vkHQIc',
        alg: 'ES256',
        kty: 'EC',
        crv: 'P-256',
        use: 'sig',
        x: 'XSxuwW_VI_s6lAw6LAlL8N7REGzQd_zXeIVDHP_j_Do',
        y: '88-aI4WAEl4YmUpew40a9vq_w5OcFvsuaKMxJRLRLL0'
      }),
  'https://smarthealthcard.phsa.ca/v1/issuer':
      importJWK({
        kid: 'XCqxdhhS7SWlPqihaUXovM_FjU65WeoBFGc_ppent0Q',
        alg: 'ES256',
        kty: 'EC',
        crv: 'P-256',
        use: 'sig',
        x: 'xscSbZemoTx1qFzFo-j9VSnvAXdv9K-3DchzJvNnwrY',
        y: 'jA5uS5bz8R2nxf_TU-0ZmXq6CKWZhAG1Y4icAx8a9CA'
      })
}

export async function getKnownIssuers(issuer: string) {
  return await knownIssuer[issuer]
}

