var defaultQuery1 = "MATCH app\nWHERE\n" + '<uses-permission android:name= "android.permission.ACCESS_FINE_LOCATION" />\n' +
    '<code class="android.telephony.SmsManager" method ="sendDataMessage" />\n' +
    "<LinearLayout>\n\t<Button/>\n\t<Button/>\n</LinearLayout>" +
    "\nRETURN app";

function Frame() {
    this.id = Frame.prototype.count
    this.query = defaultQuery1
    Frame.prototype.count += 1
}

Frame.prototype.count = 1

var NoteBook = React.createClass({

    getInitialState: function () {
        var f = new Frame()
        return {
            frames: [f]
        }
    },

    handleSearchDidComplete: function (frame) {
        console.log('did complete', frame)
        if (frame.props.isFirst) {
            this.addNewFrame()
        }
    },

    handleCopyToTop: function (frame) {
        console.log('to copy')
        var q = frame.getQuery()
        this.addNewFrame(q)
    },

    addNewFrame: function (q) {
        var frame = new Frame()
        if (q) {
            frame.query = q
        }
        this.state.frames = [frame].concat(this.state.frames)
        this.setState({frames: this.state.frames, selected: frame.id})
    },

    handleUse: function (i) {
        var example = this.props.examples[i]
        console.log(example)
        this.addNewFrame(example)
    },

    handleFocusChange: function (f, hasFocus) {
        console.log('focus change f:', f.state)
        if (hasFocus) {//} && f != this.state.currentFrameComponent){            
            this.setState({selected: f.props.frame.id})
        }
    },

    componentDidMount: function () {
        this.setState({selected: 1})
    },

    render: function () {
        var frames = this.state.frames
        var self = this
        var fs = frames.map(function (frame, i) {
            return <FrameComponent frame={frame}
                                   query={defaultQuery1}
                                   key={frame.id}
                                   isFirst={i == 0}
                                   isSelected={frame.id == self.state.selected}
                                   onFocusChange={self.handleFocusChange}
                                   onCopyToTop={self.handleCopyToTop}
                                   onSearchDidComplete={self.handleSearchDidComplete}/>
        })

        var exampleStyle = {
            paddingBottom: 5,
            fontSize: '50%'
        }

        var pre = {
            fontSize: 10
        }

        var self = this
        var es = this.props.examples.map(function (e, i) {
            return <div style={exampleStyle} key={i}>
                <pre style={pre}>{e}</pre>
                <button onClick={_.partial(self.handleUse, i)}
                        className="btn btn-info"
                    >
                    Use
                </button>
            </div>
        })

        return <div className="row">
            <div className="col-md-3">
                <h5>Examples</h5>
                {es}
            </div>
            <div className="col-md-9">
                {fs}
            </div>
        </div>
    }
});

var FrameComponent = React.createClass({

    getInitialState: function () {
        return {
            results: [],
            isRunning: false,
            editorHasFocus: false,
            isCurrent: false
        }
    },

    componentDidMount: function () {
    },

    handleCopyButtonPressed: function () {
        if (this.props.onCopyToTop) {
            this.props.onCopyToTop(this)
        }
    },

    handleFocusChange: function (hasFocus) {
        if (this.props.onFocusChange) {
            this.props.onFocusChange(this, hasFocus)
        }
    },

    handleSearch: function () {


        var query_text = this.refs.editor.getValue()
        console.log('submit query:', query_text)
        this.setState({isRunning: true})
        this.refs.viewer.setState({results: []})

        $.ajax({
            url: '/q/json',
            data: {queryText: query_text},
            dataType: 'json',
            success: function (data) {
                console.log('got search result from server:', data)
                this.refs.viewer.setState({results: data})
                this.setState({isRunning: false})
                if (this.props.onSearchDidComplete) {
                    this.props.onSearchDidComplete(this)
                }
            }.bind(this),
            error: function (xhr, status, err) {
                //console.error(this.props.url, status, err.toString());
            }.bind(this)
        })
    },

    getQuery: function () {
        return this.refs.editor.getValue()
    },

    handleFocus: function () {
        console.log('button focus')
    },

    render: function () {

        var s1 = {
            height: '100%'
        }

        var editorStyle = {
            top: 10,
            height: 100,
            left: 300
        }

        var viewerStyle = {
            maxHeight: 300,
            paddingLeft: 30,
            overflow: 'scroll'
        }

        var statusMessage
        if (this.state.isRunning) {
            statusMessage = 'Running ...'
        } else {
            statusMessage = ''

        }

        var frameStyle = {
            marginBottom: 20,
            border: '1px solid grey',
            padding: 5
        }

        var runButton = <button key="run" className="btn btn-primary"
                                onClick={this.handleSearch}>
            <span>Run</span>
        </button>

        var copyButton =
            <button key="copy" className="btn btn-info"
                    onClick={this.handleCopyButtonPressed}>
                <span>Copy To Top</span>
            </button>

        var buttons = [runButton]
        if (!this.props.isFirst) {
            buttons.push(copyButton)
        }

        var idStyle = {
            position: 'absolute',
            width: 100
        }

        var m = {
            position: 'relative'
        }

        // var buttonsStyle = {}
        // if (!this.state.editorHasFocus){
        //     buttonsStyle.display = 'none'
        // }

        return (
            <div className="row" style={frameStyle}>
                <div className="col-md-5" style={m}>
                    <div style={idStyle}>
                        {this.props.frame.id}
                    </div>

                    <QueryEditor contents={this.props.frame.query}
                                 onSearchHotkey={this.handleSearch}
                                 onFocusChange={this.handleFocusChange}
                                 ref="editor"
                                 style={editorStyle}
                        />

                    <div>
                        {this.props.isSelected ? buttons : null}
                    </div>
                </div>
                <div className="col-md-7" style={viewerStyle}>
                    {statusMessage}
                    <ResultViewer ref="viewer"/>
                </div>
            </div>
        )
    }
})


var examples = []
$('.example').each(function () {
    var s = $(this).find('.query').html()
    var m = s.match(/<!--\s*([^]*)\s*-->/)
    var query = m ? m[1] : ''
    examples.push(query)
})

var tag = $('#app')[0]
React.render(
    <NoteBook examples={examples}/>
    ,
    tag
)
