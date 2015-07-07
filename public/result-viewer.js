var ResultViewer = React.createClass({

    componentDidMount: function () {
    },

    getInitialState: function () {
        return {
            results: []
        }
    },

    render: function () {
        var style = {
            height: '100%',
            background: 'rgba(240,240,240,0.15)'
        }
        if (Array.isArray(this.state.results) === false) {
            return (
                <div className="row" key={0}>
                    <div>
                        {this.state.results}
                    </div>
                </div>
            )
        }
        var resultNodes = this.state.results.map(function (result, index) {
            return (
                <div className="row" key={index}>
                    <div className="col-md-6">
                        {result.app.id}
                    </div>
                </div>
            )
        })

        if (resultNodes.length > 0) {
            var total = resultNodes.length
            var n = Math.min(total, 10)
            var summary = <b>Showing {n} of {total} results</b>
        }

        return (<div className="resultList">
            {summary}
            {resultNodes}
        </div>)
    }


})