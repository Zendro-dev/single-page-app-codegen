import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CheckIcon from '@material-ui/icons/Check';

const useStyles = makeStyles(theme => ({
  textField: {
    margin: 'auto',
    width: '100%',
    maxWidth: 400,
    minWidth: 200,
  },
}));

export default function StringField(props) {
  const classes = useStyles();
  const {
    itemKey,
    name,
    label,
    text,
    valueOk,
    autoFocus,
    handleSetValue,
  } = props;
  
  const defaultValue = useRef((text !== undefined && typeof text === 'string' ) ? text : '');
  const textValue = useRef((text !== undefined && typeof text === 'string' ) ? text : null);

  return (
    <TextField
      id={"string-field-"+itemKey+'-'+name}
      label={label}
      multiline
      rowsMax="4"
      defaultValue={defaultValue.current}
      className={classes.textField}
      margin="normal"
      variant="filled"
      autoFocus={autoFocus!==undefined&&autoFocus===true ? true : false}
      InputProps={{
        endAdornment:
          <InputAdornment position="end">
            {(valueOk!==undefined&&valueOk===1) ? <CheckIcon color="primary" fontSize="small" /> : ''}
          </InputAdornment>
      }}
      onChange={(event) => {
        textValue.current = event.target.value;
        
        if(!textValue.current || typeof textValue.current !== 'string') {
          handleSetValue(null, 0, itemKey);
        } else {
          //status is set to 1 only on blur or ctrl+Enter
          handleSetValue(textValue.current, 0, itemKey);
        }
      }}
      onBlur={(event) => {
        if(!textValue.current || typeof textValue.current !== 'string') {
          handleSetValue(null, 0, itemKey);
        } else {
          handleSetValue(textValue.current, 1, itemKey);
        }
      }}
      onKeyDown={(event) => {
        if(event.ctrlKey && event.key === 'Enter') {
          if(!textValue.current || typeof textValue.current !== 'string') {
            handleSetValue(null, 0, itemKey);
          } else {
            handleSetValue(textValue.current, 1, itemKey);
          }
        }
      }}
    />
  );
}
StringField.propTypes = {
  itemKey: PropTypes.string.isRequired,
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  text: PropTypes.string,
  valueOk: PropTypes.number.isRequired,
  autoFocus: PropTypes.bool,
  handleSetValue: PropTypes.func.isRequired,
};