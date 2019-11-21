
import React from 'react';
import PropTypes from 'prop-types';
import StringField from './components/StringField'
import FloatField from './components/FloatField'
import IntField from './components/IntField'
import BoolField from './components/BoolField'
import DateField from './components/DateField'
import TimeField from './components/TimeField'
import DateTimeField from './components/DateTimeField'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Attributes from '@material-ui/icons/HdrWeakTwoTone';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(2),
  },
  card: {
    margin: theme.spacing(1),
    maxHeight: '77vh',
    overflow: 'auto',
  },
  cardContent: {
    marginLeft: theme.spacing(5),
    marginRight: theme.spacing(5),
    minWidth: 200,
  },
}));

export default function SequencingExperimentAttributesFormView(props) {
  const classes = useStyles();
  const { valueOkStates, 
          handleBlur, 
          handleFieldReady, 
          handleChange,
          handleKeyDown,
        } = props;

  function itemHasKey(item, index) {
    if (item !== undefined) {
      return item.key === this.key;
    } else {
      return false;
    }
  }

  function getItemsOk() {
    let countOk=0;
    if(valueOkStates.length > 0) {
      for(var i=0; i<valueOkStates.length; ++i)
      {
        if(valueOkStates[i].valueOk === 1) {
          countOk++;
        }
      }
    }
    return countOk;
  }

  function getValueOkStatus(key) {
    let it = undefined;

    //find index
    if(valueOkStates.length > 0) {
      it = valueOkStates.find(itemHasKey, {key:key});
    }
    //return status
    if(it !== undefined) {
      return it.valueOk;
    } else {
      return 0;
    }
  }

  return (
    <div className={classes.root}>
      <Grid container justify='center'>
        <Grid item xs={12}>
          <Card className={classes.card}>

            {/* Header */}
            <CardHeader
              avatar={
                <Attributes color="primary" fontSize="small" />
              }
              title={
                <Typography variant="h6">
                  SequencingExperiment attributes
                </Typography>
              }
              subheader={getItemsOk()+' / 9 completed'}
            >
            </CardHeader>
            
            {/* 
              Fields 
            */}

            {/* Name */}
            <CardContent key='name' className={classes.cardContent} >
              <StringField
                itemKey='name'
                name='name'
                label='Name'
                valueOk={getValueOkStatus('name')}
                autoFocus={true}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* Start_date */}
            <CardContent key='start_date' className={classes.cardContent} >
              <DateField
                itemKey='start_date'
                name='start_date'
                label='Start_date'
                valueOk={getValueOkStatus('start_date')}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* End_date */}
            <CardContent key='end_date' className={classes.cardContent} >
              <DateField
                itemKey='end_date'
                name='end_date'
                label='End_date'
                valueOk={getValueOkStatus('end_date')}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* Description */}
            <CardContent key='description' className={classes.cardContent} >
              <StringField
                itemKey='description'
                name='description'
                label='Description'
                valueOk={getValueOkStatus('description')}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* Float */}
            <CardContent key='float' className={classes.cardContent} >
              <FloatField
                itemKey='float'
                name='float'
                label='Float'
                valueOk={getValueOkStatus('float')}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* Date_time */}
            <CardContent key='date_time' className={classes.cardContent} >
              <DateTimeField
                itemKey='date_time'
                name='date_time'
                label='Date_time'
                valueOk={getValueOkStatus('date_time')}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* Time */}
            <CardContent key='time' className={classes.cardContent} >
              <TimeField
                itemKey='time'
                name='time'
                label='Time'
                valueOk={getValueOkStatus('time')}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* I */}
            <CardContent key='i' className={classes.cardContent} >
              <IntField
                itemKey='i'
                name='i'
                label='I'
                valueOk={getValueOkStatus('i')}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* Bool */}
            <CardContent key='bool' className={classes.cardContent} >
              <BoolField
                itemKey='bool'
                name='bool'
                label='Bool'
                valueOk={getValueOkStatus('bool')}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>
                        
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
SequencingExperimentAttributesFormView.propTypes = {
  valueOkStates: PropTypes.array.isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleFieldReady: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
};