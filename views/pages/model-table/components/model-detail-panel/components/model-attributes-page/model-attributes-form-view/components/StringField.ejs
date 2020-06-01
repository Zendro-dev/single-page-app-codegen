import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CheckIcon from '@material-ui/icons/Check';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(theme => ({
  textField: {
    margin: 'auto',
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
  } = props;
  
  return (
    <Grid container justify='flex-start' alignItems='center' spacing={2}>
      <Grid item xs={12}>
        <TextField
          id={"string-field-"+itemKey+'-'+name}
          label={label}
          multiline
          rowsMax="4"
          value={(text !== undefined && text !== null && typeof text === 'string' ) ? text : ''}
          className={classes.textField}
          margin="normal"
          variant="outlined"
          fullWidth
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
      </Grid>
    </Grid>
  );
}
StringField.propTypes = {
  itemKey: PropTypes.string.isRequired,
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  text: PropTypes.string,
  valueOk: PropTypes.number.isRequired,
  autoFocus: PropTypes.bool,
};