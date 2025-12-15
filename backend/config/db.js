import {neon} from '@neondatabase/serverless';

import 'dotenv/config';

// will create a sql connetion using our dataase url
export const sql = neon(process.env.DATABASE_URL);