import { pipe } from 'fp-ts/lib/function'
import { match as matchE } from 'fp-ts/lib/Either'
import test from 'tape'
import mongo from './mongo'
import { writeFileSync } from 'fs'

const { parseConf } = mongo

const validEnv =
	'{"mongo":{"hostString":"host","user":"user123","db":"dbname"}}'

const notValidEnv =
	'{"mong":{"hostString":"host","user":"user123","db":"dbname"}}'

test('should retrun Either.Left<ParseError> if niot valid value is provided', (t) => {
	t.plan(3)
	pipe(
		parseConf(undefined),
		matchE(
			(e) => t.equal((e as any)?._type, 'ParseError'),
			() => t.fail()
		)
	)

	pipe(
		parseConf(null),
		matchE(
			(e) => t.equal((e as any)?._type, 'ParseError'),
			() => t.fail()
		)
	)

	pipe(
		parseConf('asd'),
		matchE(
			(e) => t.equal((e as any)?._type, 'ParseError'),
			() => t.fail()
		)
	)
})

test('should return Errors when JSON is wrong shape', (t) => {
	t.plan(1)
	pipe(
		parseConf(notValidEnv),
		matchE(
			(e) => {
				console.log(e)
				writeFileSync('temp', JSON.stringify(e, null, 4))
				t.fail()
			},
			(conf) => t.deepEqual(conf, JSON.parse(validEnv))
		)
	)
})

test('should return MongoConf Object if value is right', (t) => {
	t.plan(1)
	pipe(
		parseConf(validEnv),
		matchE(
			() => t.fail(),
			(conf) => t.deepEqual(conf, JSON.parse(validEnv))
		)
	)
})
