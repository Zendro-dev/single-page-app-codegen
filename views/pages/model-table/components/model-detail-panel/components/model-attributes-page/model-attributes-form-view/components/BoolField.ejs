import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const useStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
  },
  checkbox: {
    padding: theme.spacing(2),
  },
}));

export default function BoolField(props) {
  const classes = useStyles();
  const {
    itemKey,
    name,
    label,
    text,
    valueOk,
    autoFocus,
  } = props;

  function getInitialChecked() {
    if(text !== undefined && text !== null) {

      if(typeof text === 'string' &&  (text === 'true' || text === 'false')) {
        if(text === 'true') {
          return true;
  
        } else if (text === 'false') {
          return false;
  
        } else {
          return false;

        }
      } else if(typeof text === 'boolean') {
        return text;

      } else {
        return false;

      }
    }else {
      return false;

    }
  }

  return (
    <FormControl className={classes.root} component="fieldset">
      <FormLabel component="legend">{label}</FormLabel>
        <FormControlLabel
          control={
            <Checkbox
              id={"bool-field-"+itemKey+'-'+name}
              className={classes.checkbox}
              checked={getInitialChecked()} 
              color="primary"
              indeterminate={(valueOk===0)}
              autoFocus={autoFocus!==undefined&&autoFocus===true ? true : false}
            />
          }
        />
    </FormControl>
  );
}
BoolField.propTypes = {
  itemKey: PropTypes.string.isRequired,
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
  valueOk: PropTypes.number.isRequired,
  autoFocus: PropTypes.bool,
};