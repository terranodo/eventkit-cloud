import React, {Component} from 'react';
import {Card, CardHeader, CardMedia} from 'material-ui/Card';
import Swipeable from 'react-swipeable';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import NavigationArrowDropUp from 'material-ui/svg-icons/navigation/arrow-drop-up';

export class QuickTourSection extends Component {

    constructor(props) {
        super(props);
        this.nextStep = this.nextStep.bind(this);
        this.previousStep = this.previousStep.bind(this);
        this.goToStep = this.goToStep.bind(this);
        this.setArrowVisibility = this.setArrowVisibility.bind(this);
        this.state = {
            step: 0,
            showLeftArrow: false,
            showRightArrow: false,
            arrowsVisible: false
        }
    };

    nextStep() {
        if(this.state.step + 1 < this.props.steps.length) {
            this.setState({step: this.state.step + 1});
        }
        else {
            this.setState({step: 0});
        }
    }

    previousStep() {
        if(this.state.step > 0) {
            this.setState({step: this.state.step - 1});
        }
        else {
            this.setState({step: this.props.steps.length - 1});
        }
    }

    goToStep(step) {
        if(step < this.props.steps.length && step >= 0) {
            this.setState({step: step});
        }
    }

    setArrowVisibility(visible) {
        this.setState({arrowsVisible: visible});
    }

    render() {
        const styles = {
            numberStyle: {
                border: '2px solid #fff', 
                borderRadius: '50%', 
                width: '20px', 
                height: '20px', 
                textAlign: 'center', 
                fontSize: '10px', 
                display: 'inline-block', 
                marginLeft: '10px', 
                backgroundColor: '#fff', 
                color: '#4598bf',
                cursor: 'pointer',
            },
            nextImgArrow: {
                width: '48px', 
                height: '48px', 
                minWidth: 'none', 
                color: '#4598bf',
                textAlign: 'center', 
            },
            nextImgDiv: {
                position: 'absolute', 
                width: '48px', 
                height: '48px', 
                minWidth: 'none',
                borderRadius: '50%',
                color: '#4598bf', 
                top: 'calc(50% - 24px)',
                backgroundColor: 'rgba(69, 152, 191, 0.2)'
            }
        };
        const stepTotal = this.props.steps.length;
        const arrowOpacity = this.state.arrowsVisible ? 1: 0;

        return (
            <div style={{margin: '10px 0px'}}>
                <Card initiallyExpanded={true} style={{backgroundColor: '#dcdcdc'}}>
                    <CardHeader
                        showExpandableButton={true}
                        title={<strong>{this.props.sectionTitle}</strong>}
                        openIcon={<NavigationArrowDropUp style={{fill: 'red'}}/>}
                        closeIcon={<NavigationArrowDropDown style={{fill: 'green'}}/>}
                    />
                    <CardMedia expandable={true} style={{padding: '0px 10px 10px 10px'}}>
                        <div style={{width: '100%', height: '100%', position: 'relative'}}
                            onMouseEnter={() => {this.setArrowVisibility(true)}}
                            onTouchStart={() => {this.setArrowVisibility(true)}}
                            onMouseLeave={() => {this.setArrowVisibility(false)}}
                            onTouchMove={() => {this.setArrowVisibility(false)}}
                            onClick={() => {this.setArrowVisibility(false)}}
                        >
                            <Swipeable
                                onSwipedLeft={this.nextStep}
                                onSwipedRight={this.previousStep}
                            >
                                <img src={this.props.steps[this.state.step].img} style={{width: '100%'}}/>
                            </Swipeable>
                            <div 
                                style={{...styles.nextImgDiv, left: '20px', opacity: arrowOpacity}}
                            >
                                <ChevronLeft style={styles.nextImgArrow} onClick={this.nextStep}/>
                            </div>
                            <div 
                                style={{...styles.nextImgDiv, right: '20px', opacity: arrowOpacity}}
                            >
                                <ChevronRight style={styles.nextImgArrow} onClick={this.nextStep}/>
                            </div>
                        </div>
                        <div style={{width: '100%', backgroundColor: '#4598bf', color: '#fff', padding: '7px 10px'}}>
                            <div style={{display: 'inline-block', width: `calc(100% - ${stepTotal * 30}px)`, lineHeight: '22px'}}>
                                {this.props.steps[this.state.step].caption}
                            </div>
                            <div style={{display: 'inline-block', width: `${stepTotal * 30}px`, verticalAlign: 'top'}}>
                                {this.props.steps.map((item, ix) => {
                                    const style = {
                                        ...styles.numberStyle, 
                                        backgroundColor: this.state.step == ix ? '#fff': 'inherit', 
                                        color: this.state.step == ix ? '#4598bf': 'inherit'
                                    } 
                                    return <div key={ix} style={style} onClick={() => {this.goToStep(ix)}}>{ix + 1}</div>
                                })}
                            </div>
                        </div>
                    </CardMedia>
                </Card>
            </div>
        );
    };
};

QuickTourSection.PropTypes = {
    steps: React.PropTypes.arrayOf(React.PropTypes.shape({
        img: React.PropTypes.obj,
        caption: React.PropTypes.string,
    })).isRequired,
    sectionTitle: React.PropTypes.string.isRequired,
}

export default QuickTourSection;
