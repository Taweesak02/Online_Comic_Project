import FilterGroup from './FilterGroup';

export default function SortFilterGroup(props) {
  return (
    <FilterGroup {...props} variant="sort" multiSelect={false} />
  );
}
