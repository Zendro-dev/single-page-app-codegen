import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CheckIcon from '@material-ui/icons/Check';

const useStyles = makeStyles(theme => ({
  textField: {
    margin: 'auto',
    width: '100%',
    maxWidth: 300,
    minWidth: 200,
  },
}));

export default function FloatField(props) {
  const classes = useStyles();
  const {
    itemKey,
    name,
    label,
    text,
    valueOk,
    autoFocus,
  } = props;

  function getInitialValue() {
    if(text !== undefined && text !== null) {
      
      if(typeof text === 'string' && text.trim() !== '') {
        return text;
      
      } else if(typeof text === 'number') {
        return text.toString();
      
      } else {
        return '';
      
      }
    } else {
      return  '';

    }
  }

  return (
      <TextField
        id={"float-field-"+itemKey+'-'+name}
        label={label}
        type="number"
        value={getInitialValue()}
        className={classes.textField}
        margin="normal"
        variant="outlined"
        placeholder=""
        autoFocus={autoFocus!==undefined&&autoFocus===true ? true : false}
        InputProps={{
          endAdornment:
            <InputAdornment position="end">
              {(valueOk!==undefined&&valueOk===1) ? <CheckIcon color="primary" fontSize="small" /> : ''}
            </InputAdornment>,
          readOnly: true
        }}
        InputLabelProps={{ 
          shrink: true
        }}
        inputProps={{ 
          spellCheck: 'false'
        }}
      />
  );
}
FloatField.propTypes = {
  itemKey: PropTypes.string.isRequired,
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  valueOk: PropTypes.number.isRequired,
  autoFocus: PropTypes.bool,
};