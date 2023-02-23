import { utils } from 'aframe'

export function parse (...args) {
  return utils.styleParser.stringify(...args)
}
