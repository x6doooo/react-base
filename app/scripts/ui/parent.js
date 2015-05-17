/**
 * Created by dx.yang on 15/5/15.
 */

var Child = require('./child')

var Parent = React.createClass({
    render: function(){
        return (
            <div>
                <div> This is the parent. 1</div>
                <Child name="child"/>
            </div>
        )
    }
});

module.exports = Parent;
