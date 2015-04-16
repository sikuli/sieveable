var defaultQuery = 'MATCH app\n' + 'WHERE\n' +
    '<LinearLayout>\n\t<ImageButton></ImageButton>\n\t<ImageButton></ImageButton>\n</LinearLayout>\n' +
        'RETURN app'

var App = React.createClass({

    componentDidMount: function() {
    },

    handleSearch: function(){

        var query_text = this.refs.editor.getValue()
        console.log('submit query:', query_text)

        $.ajax({
            url: '/q/json',
            data: {queryText: query_text},
            dataType: 'json',
            success: function(data) {
                console.log('got search result from server:', data)
                this.refs.viewer.setState({results: data})
            }.bind(this),
            error: function(xhr, status, err) {
                //console.error(this.props.url, status, err.toString());
            }.bind(this)
        })
    },

    render: function() {

        var s1 = {
            height: '100%'
        }
       
        return (
            <div className="row">
                <div className="col-md-4">
                    <QueryEditor contents={defaultQuery} onSearchHotkey={this.handleSearch} ref="editor"/>
                    <button className="btn btn-primary" onClick={this.handleSearch}>
                        <span>Search</span>                        
                    </button>
                </div>
                <div className="col-md-8">
                    <ResultViewer ref="viewer"/>
                </div>
            </div>
        )
    }
})

var tag = $('#query-editor')[0]
React.render(<App/>,
   tag
)
