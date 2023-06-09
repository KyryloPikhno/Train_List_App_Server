const moment = require("moment/moment");
const {Op} = require("sequelize");

const {dateEnum} = require("../enum");
const {Train} = require("../models");
const momentDate = require("ws/lib/Extensions");


module.exports = {
    find: async (params) => {
        const {from_city, to_city, date} = params;

        let query = {};

        if (from_city && to_city && date) {
            if (!moment(date, dateEnum.DATE_FORMAT, true).isValid()) {
                throw new Error('Invalid date format');
            }
            console.log('date before formatting:', date);
            console.log('date after formatting:', momentDate.format(dateEnum.DATE_FORMAT));
            query = {
                where: {
                    from_city,
                    to_city,
                    date: moment(date).add(1, 'day'),
                },
            };
            } else if (from_city && to_city) {
            const nextWeek = moment().add(dateEnum.DAYS_COUNT, dateEnum.DAYS).format(dateEnum.DATE_FORMAT);
            query = {
                where: {
                    from_city,
                    to_city,
                    date: {
                        [Op.between]: [moment().format(dateEnum.DATE_FORMAT), nextWeek],
                    },
                },
                order: [['date', 'ASC']]
            };
        } else if (date) {
            if (!moment(date, dateEnum.DATE_FORMAT, true).isValid()) {
                throw new Error('Invalid date format');
            }
            query = {
                where: {
                    date: moment(date).format(dateEnum.DATE_FORMAT),
                },
            };
        }

        if (!from_city && !to_city && !date) {
            return [];
        }

        return await Train.findAll(query);
    }
};
