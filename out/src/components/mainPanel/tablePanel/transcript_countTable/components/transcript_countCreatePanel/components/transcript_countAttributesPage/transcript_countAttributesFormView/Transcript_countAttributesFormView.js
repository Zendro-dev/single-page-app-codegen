<script>
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

export default function Transcript_countAttributesFormView(props) {
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
                  Transcript_count attributes
                </Typography>
              }
              subheader={getItemsOk()+' / 6 completed'}
            >
            </CardHeader>
            
            {/* 
              Fields 
            */}

            {/* Gene */}
            <CardContent key='gene' className={classes.cardContent} >
              <StringField
                itemKey='gene'
                name='gene'
                label='Gene'
                valueOk={getValueOkStatus('gene')}
                autoFocus={true}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* Variable */}
            <CardContent key='variable' className={classes.cardContent} >
              <StringField
                itemKey='variable'
                name='variable'
                label='Variable'
                valueOk={getValueOkStatus('variable')}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* Count */}
            <CardContent key='count' className={classes.cardContent} >
              <FloatField
                itemKey='count'
                name='count'
                label='Count'
                valueOk={getValueOkStatus('count')}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* Tissue_or_condition */}
            <CardContent key='tissue_or_condition' className={classes.cardContent} >
              <StringField
                itemKey='tissue_or_condition'
                name='tissue_or_condition'
                label='Tissue_or_condition'
                valueOk={getValueOkStatus('tissue_or_condition')}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* Individual_id */}
            <CardContent key='individual_id' className={classes.cardContent} >
              <IntField
                itemKey='individual_id'
                name='individual_id'
                label='Individual_id'
                valueOk={getValueOkStatus('individual_id')}
                handleBlur={handleBlur}
                handleReady={handleFieldReady}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
              />
            </CardContent>

            {/* Aminoacidsequence_id */}
            <CardContent key='aminoacidsequence_id' className={classes.cardContent} >
              <IntField
                itemKey='aminoacidsequence_id'
                name='aminoacidsequence_id'
                label='Aminoacidsequence_id'
                valueOk={getValueOkStatus('aminoacidsequence_id')}
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
Transcript_countAttributesFormView.propTypes = {
  valueOkStates: PropTypes.array.isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleFieldReady: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
};