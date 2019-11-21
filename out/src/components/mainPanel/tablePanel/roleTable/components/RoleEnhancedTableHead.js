import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

export default function RoleEnhancedTableHead(props) {
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
          key='name'
          align='left'
          padding="default"
          sortDirection={orderBy === 'name' ? order : false}
        >
          {/* Name */}
          <TableSortLabel
              active={orderBy === 'name'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'name')}}
          >
            <Typography color="inherit" variant="overline">
              Name
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='description'
          align='left'
          padding="default"
          sortDirection={orderBy === 'description' ? order : false}
        >
          {/* Description */}
          <TableSortLabel
              active={orderBy === 'description'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'description')}}
          >
            <Typography color="inherit" variant="overline">
              Description
            </Typography>
          </TableSortLabel>
        </TableCell>
        
      </TableRow>
    </TableHead>
  );
}
RoleEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};