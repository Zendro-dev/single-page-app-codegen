import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

export default function SequencingExperimentEnhancedTableHead(props) {
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
          key='start_date'
          align='left'
          padding="default"
          sortDirection={orderBy === 'start_date' ? order : false}
        >
          {/* Start_date */}
          <TableSortLabel
              active={orderBy === 'start_date'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'start_date')}}
          >
            <Typography color="inherit" variant="overline">
              Start_date
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='end_date'
          align='left'
          padding="default"
          sortDirection={orderBy === 'end_date' ? order : false}
        >
          {/* End_date */}
          <TableSortLabel
              active={orderBy === 'end_date'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'end_date')}}
          >
            <Typography color="inherit" variant="overline">
              End_date
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
        
        <TableCell
          key='float'
          align='right'
          padding="default"
          sortDirection={orderBy === 'float' ? order : false}
        >
          {/* Float */}
          <TableSortLabel
              active={orderBy === 'float'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'float')}}
          >
            <Typography color="inherit" variant="overline">
              Float
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='date_time'
          align='left'
          padding="default"
          sortDirection={orderBy === 'date_time' ? order : false}
        >
          {/* Date_time */}
          <TableSortLabel
              active={orderBy === 'date_time'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'date_time')}}
          >
            <Typography color="inherit" variant="overline">
              Date_time
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='time'
          align='left'
          padding="default"
          sortDirection={orderBy === 'time' ? order : false}
        >
          {/* Time */}
          <TableSortLabel
              active={orderBy === 'time'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'time')}}
          >
            <Typography color="inherit" variant="overline">
              Time
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='i'
          align='right'
          padding="default"
          sortDirection={orderBy === 'i' ? order : false}
        >
          {/* I */}
          <TableSortLabel
              active={orderBy === 'i'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'i')}}
          >
            <Typography color="inherit" variant="overline">
              I
            </Typography>
          </TableSortLabel>
        </TableCell>
        
        <TableCell
          key='bool'
          align='left'
          padding="default"
          sortDirection={orderBy === 'bool' ? order : false}
        >
          {/* Bool */}
          <TableSortLabel
              active={orderBy === 'bool'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'bool')}}
          >
            <Typography color="inherit" variant="overline">
              Bool
            </Typography>
          </TableSortLabel>
        </TableCell>
        
      </TableRow>
    </TableHead>
  );
}
SequencingExperimentEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};