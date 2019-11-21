import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

export default function Transcript_countEnhancedTableHead(props) {
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
          key='gene'
          align='left'
          padding="default"
          sortDirection={orderBy === 'gene' ? order : false}
        >
          {/* Gene */}
          <TableSortLabel
              active={orderBy === 'gene'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'gene')}}
          >
            <Typography color="inherit" variant="overline">
              Gene
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='variable'
          align='left'
          padding="default"
          sortDirection={orderBy === 'variable' ? order : false}
        >
          {/* Variable */}
          <TableSortLabel
              active={orderBy === 'variable'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'variable')}}
          >
            <Typography color="inherit" variant="overline">
              Variable
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='count'
          align='right'
          padding="default"
          sortDirection={orderBy === 'count' ? order : false}
        >
          {/* Count */}
          <TableSortLabel
              active={orderBy === 'count'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'count')}}
          >
            <Typography color="inherit" variant="overline">
              Count
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='tissue_or_condition'
          align='left'
          padding="default"
          sortDirection={orderBy === 'tissue_or_condition' ? order : false}
        >
          {/* Tissue_or_condition */}
          <TableSortLabel
              active={orderBy === 'tissue_or_condition'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'tissue_or_condition')}}
          >
            <Typography color="inherit" variant="overline">
              Tissue_or_condition
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='individual_id'
          align='right'
          padding="default"
          sortDirection={orderBy === 'individual_id' ? order : false}
        >
          {/* Individual_id */}
          <TableSortLabel
              active={orderBy === 'individual_id'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'individual_id')}}
          >
            <Typography color="inherit" variant="overline">
              Individual_id
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='aminoacidsequence_id'
          align='right'
          padding="default"
          sortDirection={orderBy === 'aminoacidsequence_id' ? order : false}
        >
          {/* Aminoacidsequence_id */}
          <TableSortLabel
              active={orderBy === 'aminoacidsequence_id'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'aminoacidsequence_id')}}
          >
            <Typography color="inherit" variant="overline">
              Aminoacidsequence_id
            </Typography>
          </TableSortLabel>
        </TableCell>
        
      </TableRow>
    </TableHead>
  );
}
Transcript_countEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};