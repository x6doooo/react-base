/**
 * Created by dx.yang on 15/5/20.
 */

var guid = require('../../modules/guid');

var globalConfig = {
    //highstock
    //useHighStocks: true,
    //rangeSelector : {
    //    selected : 1
    //},
    // highcharts
    global: {
        useUTC: false
    },
    exporting: {
        enabled: false
    },
    lang: {
        //highstock
        noData: '暂无数据',
        thousandsSep: '',
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        shortMonths: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    },
    yAxis: {
        //min: 0,
        //minorTickInterval: 'auto',
        title: '',
        tickColor: '#eee',
        gridLineColor: '#eee'
    },
    //highcharts
    //noData: '暂无数据',
    xAxis: {
        title: '',
        lineColor: 'transparent',
        tickWidth: 0,
        startOnTick: true,
        endOnTick: true,
        showFirstLabel: true,
        showLastLabel: true,
        gridLineColor: '#eee',
        tickColor: '#eee',
        gridLineWidth: 1,
        type: 'datetime',
        dateTimeLabelFormats: {
            second: '%H:%M:%S',
            minute: '%b-%e %H:%M',
            hour: '%H:%M',
            day: '%b月%e',
            week: '%b月%e',
            month: '%y-%b',
            year: '%Y'
        }
    },
    credits: {
        enabled: false,
        text: '',
        href: '',
        position: {
            align: 'center'
        }
    },
    title: {
        style: {
            fontSize: '14px',
            fontWeight: '800'
        },
        align: 'left',
        text: ''
    },
    subtitle: {
        text: ''
    },
    colors: [
        '#058DC7', '#50B432', '#ED561B',
        '#C4C508', '#21AEC3', '#63A069',
        '#9D3E03', '#C66BE2', '#E48627',
        '#2AB481', '#9013FE', '#C31B00'
    ]
};

Highcharts.setOptions(globalConfig);

function mergeConfig(cfg) {
    var defaultConfig = {
        navigation: {
            enabled: true,
            buttonOptions: {
                enabled: true,
                align: 'right'
            }
        },
        chart: {
            zoomType: 'x',
            //borderColor: '#ddd',
            //borderWidth: 1,
            spacingLeft: 10,
            spacingRight: 10,
            spacingTop: 20,
            spacingBottom: 20,
            type: 'line'
        },
        tooltip: {
            dateTimeLabelFormats: {
                second: '%H:%M:%S',
                minute: '%b月%e日 %H:%M',
                hour: '%b月%e日 %H:%M',
                day: '%b月%e日',
                week: '%b月%e',
                month: '%y年%b月',
                year: '%Y'
            },
            shared: true,
            crosshairs: true,
            shadow: false,
            borderRadius: 0,
            style: {
                padding: 10
            },
            backgroundColor: '#fff',
            valueDecimals: 2,
            pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
            //'{series.name}: <b>{point.y}</b><br/>'
            //valueSuffix: '',
            //shared: true
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    distance: 20
                }
            },
            series: {
                cursor: 'pointer',
                events: {
                    //click: function(ev) {
                    //}
                },
                states: {
                    hover: {
                        enabled: true
                    }
                }
            },
            area: {
                fillColor: {
                    linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    enabled: false,
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            },
            column: {
                shadow: false
            },
            line: {
                shadow: false,
                lineWidth: 1.5,
                states: {
                    hover: {
                        enabled: true,
                        lineWidth: 1.5
                    }
                },
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 1,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: []
    };
    return _.merge(defaultConfig, cfg);
}

var Hicharts = React.createClass({
    componentDidMount: function () {
        var self = this;
        self.props.config = self.props.config || {};
        self.props.certainConfig = mergeConfig(self.props.config);
        self.renderChart();
    },
    componentWillReceiveProps: function (newProps) {
    },
    renderChart: function () {
        $('.' + this.props.className).highcharts(this.props.certainConfig);
    },
    setSeries: function (data) {
        this.props.certainConfig.series = data;
        this.renderChart();
    },
    getDefaultProps: function () {
        return {
            className: guid('highcharts')
        }
    },
    render: function () {
        return (
            <div className={this.props.className}></div>
        )
    }
});

module.exports = Hicharts;
