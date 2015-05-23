/**
 * Created by dx.yang on 15/5/15.
 */

var Child = require('./child')

var Parent = React.createClass({
    componentDidMount: function() {
        console.log(this.props.a);
    },
    render: function(){
        var a = <Child name="child" />;
        this.props.a = a;
        return (
            <div>
                <div> This is the parent. 1</div>
                {a}
            </div>
        )
    }
});

module.exports = Parent;
