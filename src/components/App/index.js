
import React, { Component } from 'react';
import csvParse from 'csvtojson';
import moment from 'moment';
import BarChart from 'react-bar-chart';
import { times, padStart } from 'lodash';

import style from './index.module.scss';

export default class App extends Component {

  state = {
    byMonth: null,
    byYear: null
  };

  onFileSelect = (e) => {

    const file = e.target.files[0];

    file
      .text()
      .then((result) => {
        csvParse()
          .fromString(result)
          .then((data) => {
            this.processData(data)
          })
      })

  };

  processData(data) {

    let firstYear = -1;

    const items = data.map((item) => {

      const d     = moment(item['Order Date'], 'MM/DD/YY'),
            year  = d.format('YYYY'),
            month = d.format('MM');

      if (firstYear === -1 || year < firstYear) {
        firstYear = year;
      }

      return {
        item: item['Title'],
        price: Number(item['Item Total'].substr(1)),
        year: `${year}`,
        month: `${year}-${month}`
      }

    });

    const thisYear = moment().format('YYYY'),
          yearSpan = 1 + Number(thisYear) - Number(firstYear);

    const byMonth = times(yearSpan * 12, (i) => {

      const y = Number(firstYear) + Math.floor(i / 12),
            m = padStart(`${1 + (i % 12)}`, 2, '0');

      return {
        text: `${y}-${m}`,
        value: 0
      };

    });

    const byYear = times(yearSpan, (i) => ({
      text: `${Number(firstYear) + i}`,
      value: 0
    }))

    items.forEach((item) => {

      const monthData = byMonth.find((d) => d.text === item.month),
            yearData  = byYear.find((d) => d.text === item.year)

      if (!monthData) {
        byMonth.push({
          text: item.month,
          value: item.price
        });
      } else {
        monthData.value += item.price;
      }

      if (!yearData) {
        byYear.push({
          text: item.year,
          value: item.price
        });
      } else {
        yearData.value += item.price;
      }

    });

    const sorted = byMonth.slice().sort((a, b) => b.value - a.value)

    this.setState({
      byMonth,
      byYear
    })

  }

  render() {

    const {
      byMonth,
      byYear
    } = this.state;

    return (
      <div
        className={style.wrap}>

        {byMonth && (
          <p>
            <BarChart
              width={1000}
              height={450}
              data={byMonth}
              margin={{
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
              }} />
          </p>
        )}

        {byYear && (
          <p>
            <BarChart
              width={500}
              height={450}
              data={byYear}
              margin={{
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
              }} />
          </p>
        )}

        <p>
          <input type="file" onChange={this.onFileSelect} />
        </p>

      </div>

    );

  }

}
