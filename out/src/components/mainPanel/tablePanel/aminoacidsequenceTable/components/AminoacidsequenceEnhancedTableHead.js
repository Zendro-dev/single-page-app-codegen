import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

export default function AminoacidsequenceEnhancedTableHead(props) {
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
          key='accession'
          align='left'
          padding="default"
          sortDirection={orderBy === 'accession' ? order : false}
        >
          {/* Accession */}
          <TableSortLabel
              active={orderBy === 'accession'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'accession')}}
          >
            <Typography color="inherit" variant="overline">
              Accession
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='sequence'
          align='left'
          padding="default"
          sortDirection={orderBy === 'sequence' ? order : false}
        >
          {/* Sequence */}
          <TableSortLabel
              active={orderBy === 'sequence'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'sequence')}}
          >
            <Typography color="inherit" variant="overline">
              Sequence
            </Typography>
          </TableSortLabel>
        </TableCell>
        
      </TableRow>
    </TableHead>
  );
}
AminoacidsequenceEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};