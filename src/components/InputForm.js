import React, {Component} from 'react';
import Region from "./Region";
import Files from 'react-files'; //Sourced from https://www.npmjs.com/package/react-files
import './InputForm.css';

class InputForm extends Component {

    constructor(props) {
        super(props);
        this.state =
            {
                N: null, //Name field on page.
                D: null, //Distance field on page.
                fileName: null //Name of file uploaded to page.
            };

        this.fileReader = new FileReader();

        //Store data from .json file as accessible data in state.
        this.fileReader.onload = (event) => {
            this.setState({ jsonFile: JSON.parse(event.target.result) }, () => {
                console.log(this.state.jsonFile);
            });
        };
    }

    onChange = (e) =>
    {
        this.setState({[e.target.name]: e.target.value});
    };

    render() {
        let fileList =
            <div>
                Uploaded File: {this.state.fileName}
            </div>;

        return (
            <div className="inputDiv">
                <br/>
                <div className='row'>
                    <div className='split left'>
                        <div className='leftBox'/>
                        <div className='center'>
                            {/*File upload element*/}
                            <Files
                                className='file-uploadArea'
                                onChange={file => {
                                    this.fileReader.readAsText(file[0]);
                                    console.log(file);
                                    this.setState({fileName: file[0].name})
                                }}
                                onError={err => console.log(err)}
                                accepts={['.json']}
                                maxFiles={1}
                                maxFileSize={10000000}
                                minFileSize={0}
                                clickable
                            >
                                Drag .json files here or click to upload
                            </Files>

                            <br/>
                            {fileList}
                            <br/>

                            {/*Name input*/}
                            <div className='col1'>Name:</div>
                            <div className='col2'>
                                <input type="text" name = 'N' onChange = {this.onChange}/>
                            </div>

                            {/*Distance input*/}
                            <div className='col1'>Distance:</div>
                            <div className='col2'>
                                <input type="number" name = 'D' onChange = {this.onChange}/>
                            </div>
                        </div>
                    </div>

                    {/*Canvas that will display output*/}
                    <div className='split right'>
                        <div className='center'>
                            <Region data={this.state.jsonFile} D={this.state.D} N={this.state.N}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default InputForm;
