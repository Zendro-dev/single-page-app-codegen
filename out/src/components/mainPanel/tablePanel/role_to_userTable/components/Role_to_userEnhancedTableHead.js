import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

export default function Role_to_userEnhancedTableHead(props) {
  const {
    order,
    orderBy,
    onRequestSort
  } = props;

  return (
    <TableHead>
      <TableRow>

        {/* See-info icon */}
        <TableCell padding="checkbox" />

        {/* Actions */}
        <TableCell padding="checkbox" align='center' size='small' colSpan={2}>
          <Typography color="inherit" variant="overline">
            Actions
          </Typography>
        </TableCell>

        {/* 
          Headers 
        */}

        {/* Id */}
        <TableCell
          key='id'
          align='right'
          padding="default"
          sortDirection={orderBy === 'id' ? order : false}
        >
          <TableSortLabel
            active={orderBy === 'id'}
            direction={order}
            onClick={(event) => { onRequestSort(event, 'id') }}
          >
            <Typography color="inherit" variant="overline">
              Id
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='userId'
          align='right'
          padding="default"
          sortDirection={orderBy === 'userId' ? order : false}
        >
          {/* UserId */}
          <TableSortLabel
              active={orderBy === 'userId'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'userId')}}
          >
            <Typography color="inherit" variant="overline">
              UserId
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='roleId'
          align='right'
          padding="default"
          sortDirection={orderBy === 'roleId' ? order : false}
        >
          {/* RoleId */}
          <TableSortLabel
              active={orderBy === 'roleId'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'roleId')}}
          >
            <Typography color="inherit" variant="overline">
              RoleId
            </Typography>
          </TableSortLabel>
        </TableCell>
        
      </TableRow>
    </TableHead>
  );
}
Role_to_userEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};