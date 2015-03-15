var QueryEditor = React.createClass({

    componentDidMount: function() {

        var contents = this.props.contents
        contents = _.trim(contents)
        // console.log(contents)

        var ed = this.refs.editor.getDOMNode()

        var editor = ace.edit(ed)
        var self = this
        editor.$blockScrolling = Infinity
        editor.setValue(contents, -1)
        editor.setTheme("ace/theme/tomorrow")
        editor.getSession().setMode("ace/mode/html")
        editor.getSession().setUseWorker(false)
        editor.commands.addCommand({
            name: "search",
            bindKey: {
                win: "Shift-Return",
                mac: "Shift-Return"
            },
            exec: function(editor) {
                console.debug('shift-return pressed')
                self.props.onSearchHotkey()
            }
        })
        this.setState({
            editor: editor
        })
    },

    getValue: function() {
        return this.state.editor.getValue()
    },

    render: function() {
        var style = {
            height: '100%',
            minHeight: '300px',
            background: 'rgba(240,240,240,0.15)'
        }

    return (<div className = "editor"
            ref = "editor"
            style = {style}>
           </div>)
    }
})