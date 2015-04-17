var ResultViewer = React.createClass({

    componentDidMount: function() {
    },

    getInitialState: function() {        
        return {
            results: []
        }
    },    

    render: function() {
        var style = {
            height: '100%',
            background: 'rgba(240,240,240,0.15)'
        }

        var resultNodes = this.state.results.map(function(result,index){


            console.log('perm',result.perm)

            var perm = result.perm.map(function(p){

                console.log('p.views',p.views)
                var views = p.views.map(function(v){


                    var vvs = v.views.elems.map(function(el){
                        return <span className='label label-info'>{el.text}</span>
                    })

                    return <li><span className='label label-warning'>{v.methodName.className}</span> <span className='label label-danger'>{v.methodName.methodName}</span> {vvs}</li>
                })

                return <div>
                            <div><b>permission:</b> {p.permission[0].value}</div>
                            <div><ul>{views} </ul></div>
                       </div>
            })

            return (
                <div className="row" key={index}>
                    <h3>{result.id}</h3>
                    {perm}
                </div>
            )

        })

        if (resultNodes.length > 0){
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