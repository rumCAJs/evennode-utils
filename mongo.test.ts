import { pipe } from 'fp-ts/lib/function'
import { match as matchE } from 'fp-ts/lib/Either'
import test from 'tape'
import mongo from './mongo'

const { parseConf } = mongo

const validEnv =
	'{"mongo":{"hostString":"host","user":"user123","db":"dbname"}}'

const notValidEnvs = [
	'{"mong":{"hostString":"host","user":"user123","db":"dbname"}}',
	'{"mongo":{"hostStriing":"host","user":"user123","db":"dbname"}}',
	'{"mongo":{"hostString":"host","user":42,"db":"dbname"}}',
]

test('should return Either.Left<ParseError> if not valid JSON is provided', (t) => {
	const data = [undefined, null, 'abc']
	t.plan(data.length)

	data.forEach((env) => {
		pipe(
			parseConf(env),
			matchE(
				(e) => t.equal((e as any)?._type, 'ParseError'),
				() => t.fail()
			)
		)
	})
})

test('should return Either.Left<Errors> when JSON has wrong shape', (t) => {
	t.plan(notValidEnvs.length)

	notValidEnvs.forEach((env) => {
		pipe(
			parseConf(env),
			matchE(
				(e) => {
					t.ok(Array.isArray(e))
				},
				() => t.fail()
			)
		)
	})
})

test('should return MongoConf Object if JSON is right', (t) => {
	t.plan(1)
	pipe(
		parseConf(validEnv),
		matchE(
			() => t.fail(),
			(conf) => t.deepEqual(conf, JSON.parse(validEnv))
		)
	)
})
