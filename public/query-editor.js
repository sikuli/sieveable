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
        editor.getSession().on('change', this.handleChange)
        editor.on("focus", _.partial(this.handleFocusChange, true))
        editor.on("blur",  _.partial(this.handleFocusChange, false)) 
        this.setState({
            editor: editor
        })
        this.editor = editor
    },
    
    handleFocusChange: function(hasFocus){
        console.log('focus change', hasFocus)
        if (this.props.onFocusChange){
            this.props.onFocusChange(hasFocus)
        }
    },

    handleChange: function(){
        if (this.props.onHeightChange){            
            this.props.onHeightChange(this.getHeight())            
        }
       this.setState({width:0})//his.getContentWidth()})
    },

    getValue: function() {        
        return this.editor.getValue()
    },

    getContentWidth: function(){
        var w = this.editor.getSession().getScreenWidth() * this.editor.renderer.characterWidth
        var gutterWidth = this.editor.renderer.$gutterLayer.gutterWidth  || 41
        w += gutterWidth
        return w
    },

    componentDidUpdate: function(){
        if (this.editor){
           this.editor.resize()
        }
    },

    getContentHeight: function() {   
        if (this.editor){     
            var h =
                  this.editor.getSession().getScreenLength()
                  * this.editor.renderer.lineHeight
                  + this.editor.renderer.scrollBar.getWidth()        
            return h
        }else{
            return 0
        }
    },    

    getValue: function() {
        return this.state.editor.getValue()
    },

    render: function() {

        var style = {
            left: 20,            
            height: this.getContentHeight(),
            minHeight: '100px',
            background: 'rgba(240,240,240,0.15)'
        }

    return (<div className="editor"
            ref="editor"
            style={style}>
           </div>)
    }
})