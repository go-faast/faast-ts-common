import * as t from 'io-ts'
import { DateT, Logger, nullable, optional, enumCodec, requiredOptionalCodec, extendCodec, assertType } from '../src'

describe('types', () => {
  describe('DateT', () => {
    it('has name Date', () => {
      expect(DateT.name).toBe('Date')
    })
    it('has tag DateType', () => {
      expect(DateT._tag).toBe('DateType')
    })
    it('is returns true for valid Date', () => {
      expect(DateT.is(new Date())).toBe(true)
    })
    it('is returns false for number', () => {
      expect(DateT.is(5)).toBe(false)
    })
    it('is returns false for string', () => {
      expect(DateT.is('a')).toBe(false)
    })
    it('decode returns success for valid Date', () => {
      const x = new Date()
      const decoded = DateT.decode(x)
      expect(decoded.isRight()).toBe(true)
      expect(decoded.value).toEqual(x)
    })
    it('decode returns success for number', () => {
      const x = new Date()
      const decoded = DateT.decode(x.getTime())
      expect(decoded.isRight()).toBe(true)
      expect(decoded.value).toEqual(x)
    })
    it('decode returns success for ISO string date', () => {
      const x = new Date()
      const decoded = DateT.decode(x.toISOString())
      expect(decoded.isRight()).toBe(true)
      expect(decoded.value).toEqual(x)
    })
    it('decode returns error for invalid string', () => {
      expect(DateT.decode('abc').isLeft()).toBe(true)
    })
    it('decode returns error for object', () => {
      expect(DateT.decode({}).isLeft()).toBe(true)
    })
    it('encode returns identity', () => {
      const x = new Date()
      expect(DateT.encode(x)).toBe(x)
    })
  })
  describe('Logger', () => {
    it('has name Date', () => {
      expect(Logger.name).toBe('Logger')
    })
    it('is returns true for console', () => {
      const x: Logger = console
      expect(Logger.is(x)).toBe(true)
    })
    it('is returns true for custom implementation', () => {
      class CustomLogger implements Logger {
        error = () => {}
        warn = () => {}
        info = () => {}
        log = () => {}
        debug = () => {}
        trace = () => {}
      }
      const x = new CustomLogger()
      expect(Logger.is(x)).toBe(true)
    })
    it('decode returns success for console', () => {
      const decoded = Logger.decode(console)
      expect(decoded.isRight()).toBe(true)
      expect(decoded.value).toBe(console)
    })
    it('codec type and static interface are assignable to each other', () => {
      let codecType: t.TypeOf<typeof Logger> = console
      let staticType: Logger = codecType
      codecType = staticType
    })
    it('decode returns error for invalid object', () => {
      expect(Logger.decode({}).isLeft()).toBe(true)
    })
    it('encode returns identity', () => {
      expect(Logger.encode(console)).toBe(console)
    })
  })
  describe('nullable', () => {
    it('nullable(t.string).is returns true for string', () => {
      expect(nullable(t.string).is('a')).toBe(true)
    })
    it('nullable(t.string).is returns false for number', () => {
      expect(nullable(t.string).is(5)).toBe(false)
    })
    it('nullable(t.string).is returns true for null', () => {
      expect(nullable(t.string).is(null)).toBe(true)
    })
    it('nullable(t.string).is returns false for undefined', () => {
      expect(nullable(t.string).is(undefined)).toBe(false)
    })
  })
  describe('optional', () => {
    it('optional(t.string).is returns true for string', () => {
      expect(optional(t.string).is('a')).toBe(true)
    })
    it('optional(t.string).is returns false for number', () => {
      expect(optional(t.string).is(5)).toBe(false)
    })
    it('optional(t.string).is returns false for null', () => {
      expect(optional(t.string).is(null)).toBe(false)
    })
    it('optional(t.string).is returns true for undefined', () => {
      expect(optional(t.string).is(undefined)).toBe(true)
    })
  })
  describe('enumCodec', () => {
    enum SomeEnum {
      First = 'first',
      Second = 'second',
    }
    const SomeEnumT = enumCodec<SomeEnum>(SomeEnum, 'SomeEnum')
    it('has correct name', () => {
      expect(SomeEnumT.name).toBe('SomeEnum')
    })
    it('is returns true for first valid value', () => {
      expect(SomeEnumT.is(SomeEnum.First)).toBe(true)
    })
    it('is returns true for second valid value', () => {
      expect(SomeEnumT.is(SomeEnum.First)).toBe(true)
    })
    it('is returns false for invalid value', () => {
      expect(SomeEnumT.is('third')).toBe(false)
    })
  })
  describe('requiredOptionalCodec', () => {
    const ExampleT = requiredOptionalCodec(
      {
        a: t.string,
        b: t.number,
      },
      {
        c: t.number,
      },
      'Example',
    )
    it('has correct name', () => {
      expect(ExampleT.name).toBe('Example')
    })
    it('is returns true when all values provided', () => {
      expect(ExampleT.is({ a: '', b: 0, c: 0 })).toBe(true)
    })
    it('is returns true when only required provided', () => {
      expect(ExampleT.is({ a: '', b: 0 })).toBe(true)
    })
    it('is returns false when required missing', () => {
      expect(ExampleT.is({ a: '' })).toBe(false)
    })
  })
  describe('extendCodec', () => {
    const ParentT = t.type(
      {
        p: t.string,
      },
      'Parent',
    )
    describe('all args provided', () => {
      const ChildT = extendCodec(
        ParentT,
        {
          a: t.string,
          b: t.number,
        },
        {
          c: t.number,
        },
        'Child',
      )
      it('has correct name', () => {
        expect(ChildT.name).toBe('Child')
      })
      it('is returns true when all values provided', () => {
        expect(ChildT.is({ p: '', a: '', b: 0, c: 0 })).toBe(true)
      })
      it('is returns true when only required provided', () => {
        expect(ChildT.is({ p: '', a: '', b: 0 })).toBe(true)
      })
      it('is returns false when child required missing', () => {
        expect(ChildT.is({ p: '', a: '' })).toBe(false)
      })
      it('is returns false when parent required missing', () => {
        expect(ChildT.is({ a: '', b: '', c: 0 })).toBe(false)
      })
    })
    describe('optional arg omitted', () => {
      const ChildT = extendCodec(
        ParentT,
        {
          a: t.string,
          b: t.number,
        },
        'Child',
      )
      it('has correct name', () => {
        expect(ChildT.name).toBe('Child')
      })
      it('is returns true when all values provided', () => {
        expect(ChildT.is({ p: '', a: '', b: 0 })).toBe(true)
      })
      it('is returns true when only required provided', () => {
        expect(ChildT.is({ p: '', a: '', b: 0 })).toBe(true)
      })
      it('is returns false when child required missing', () => {
        expect(ChildT.is({ p: '', a: '' })).toBe(false)
      })
      it('is returns false when parent required missing', () => {
        expect(ChildT.is({ a: '', b: '' })).toBe(false)
      })
    })
    describe('required arg empty', () => {
      const ChildT = extendCodec(
        ParentT,
        {},
        {
          c: t.number,
        },
        'Child',
      )
      it('has correct name', () => {
        expect(ChildT.name).toBe('Child')
      })
      it('is returns true when all values provided', () => {
        expect(ChildT.is({ p: '', c: 0 })).toBe(true)
      })
      it('is returns true when only required provided', () => {
        expect(ChildT.is({ p: '' })).toBe(true)
      })
      it('is returns false when parent required missing', () => {
        expect(ChildT.is({ c: 0 })).toBe(false)
      })
    })
    describe('required and optional arg empty', () => {
      const ChildT = extendCodec(ParentT, {}, {}, 'Child')
      it('is equivalent to parent', () => {
        expect(ChildT).toBe(ParentT)
      })
    })
  })
})
