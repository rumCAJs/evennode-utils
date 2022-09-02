import * as t from 'io-ts'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/lib/function'

const MongoConf = t.type({
	mongo: t.type({
		hostString: t.string,
		user: t.string,
		db: t.string,
	}),
})

export type MongoConf = t.TypeOf<typeof MongoConf>

export interface ParseError {
	_type: 'ParseError'
	msg: string
	details?: string
}

const parseConf = (
	envString: string | null | undefined
): E.Either<ParseError | t.Errors, MongoConf> =>
	pipe(
		E.tryCatch<ParseError, object>(
			() => {
				if (!envString) {
					throw new Error()
				}
				return JSON.parse(envString)
			},
			(e: any) =>
				({
					_type: 'ParseError',
					msg: 'Given value is not valid JSON',
					details: e?.message,
				} as ParseError)
		),
		E.chainW(MongoConf.decode)
	)

export default {
	parseConf,
}
