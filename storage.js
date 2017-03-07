const moment = require('moment')
const path = require('path')
const osHomedir = require('os-homedir')

// makes a sqlite db if doesn't exists
const knex = require('knex')({
  dialect: 'sqlite3',
  connection: {
    filename: path.join(osHomedir(), '.moro-database.db')
  },
  useNullAsDefault: true
})

// without calling this the program doesn't exit
const destroyKnex = () => {
  knex.destroy()
}

// Create a table
const createTable = knex.schema.createTableIfNotExists('records', (table) => {
  table.increments('id')
  table.date('date')
  table.time('start')
  table.time('end')
  table.text('note')
  table.text('extra')
  table.integer('breakDuration')
})
  .catch((e) => console.log('Errors in createTable', e))

const updateDatabase = (
  date, start, end, breakDuration, note, action
) => {
  // Then query the table...
  createTable
    .then(() => {
      return knex
        .select('*')
        .from('records')
        .where({date})
    })
    .then((row) => {
      // date is there, update the row
      if (row.length === 1) {
        switch (action) {
          case 'setStart':
            return knex('records').update({start}).where({date})
          case 'setEnd':
            return knex('records').update({end}).where({date})
          case 'setBreakDuration':
            return knex('records').update({breakDuration}).where({date})
          case 'addNote':
            return knex('records').update({note}).where({date})
        }
      } else {
        // date doesn't exist, insert it
        return knex.insert({date, start, end, breakDuration, note}).into('records')
      }
    })
    // Finally, add a .catch handler for the promise chain
    .catch(function (e) {
      console.error(e)
    })
    .finally(destroyKnex)
}

const getDateReport = (date) => (
  // Then query the table...
  createTable
  .then(() => {
    return knex
      .select('*')
      .from('records')
      .where({date})
  })
  .then((row) => row[0])
  .catch(err => {
    console.log(err)
  })
)

// if start / end is not yet marked, yell at the user
const getUndoneWarnings = (dayRecord) => {
  if (!dayRecord.start) {
    return 'start of your work day is not marked!'
  }
  if (!dayRecord.end) {
    return 'end of your work day is not marked!'
  }
  return undefined
}
const calculateWorkHours = (date) => (
  getDateReport(date)
    .then((data) => {
      if (getUndoneWarnings(data)) {
        console.log(getUndoneWarnings(data))
        return
      }
      let workHoursIsNegative = false
      // console.log('data is: ', data)
      const getStartHour = (data) => data.start && data.start.split(':')[0]
      const getStartMinute = (data) => data.start && data.start.split(':')[1]
      const getEndHour = (data) => data.end && data.end.split(':')[0]
      const getEndMinute = (data) => data.end && data.end.split(':')[1]
      const getBreak = (data) => data.breakDuration

      // to assign hours to moment objects, we need the diff so current moment is fine
      const start = moment({
        hour: getStartHour(data), minute: getStartMinute(data)
      })

      const end = moment({
        hour: getEndHour(data), minute: getEndMinute(data)
      })
      // substract break time
      .subtract({minutes: getBreak(data)})

      const workHours = moment.duration(end.diff(start))

      // to show negative work hours
      if (start.isAfter(end)) {
        workHoursIsNegative = true
      }

      const hours = workHours.get('hours')
      const minutes = workHours.get('minutes')
      // to add negative sign
      const formattedWorkHours = `${workHoursIsNegative ? '(minus)' : ''} ${hours} Hours and ${minutes} Minutes`

      const message = `You have worked ${formattedWorkHours} today`
      return {message, workHours: formattedWorkHours}
    })
    .catch((err) => {
      console.log(err)
    })
)

const getFullReport = () => {
  createTable
    .then(() => {
      return knex.select('date')
        .from('records')
        .whereNotNull('start')
        .whereNotNull('end')
        .then((rows) => {
          rows.forEach((row) => {
            calculateWorkHours(row.date)
              .then((data) => {
                console.log('Date', ' - ', 'Work hours')
                console.log(row.date, ' - ', data.workHours)
              })
          })
        })
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(destroyKnex)
}

module.exports = {
  getDateReport,
  updateDatabase,
  calculateWorkHours,
  destroyKnex,
  getFullReport
}
